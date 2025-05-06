"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Icons from Lucide React
import { Upload, Plus, PlusSquare, Loader2, FilePlus } from "lucide-react";

// Dialog component from your UI library (Custom or UI Framework)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";  // Update path to where your dialog components are located

// UI components like Button, Input, etc.
import { Button } from "../ui/button";  // Button component
import { Input } from "../ui/input";  // Input component

// Form components from your UI library (Custom or UI Framework)
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";  // Form handling components

// Toast for notifications
import { toast } from "../ui/use-toast";  // Toast notifications

// Custom actions for interacting with the server-side (such as creating resumes)
import { createResume } from "@/lib/actions/resume.actions";  // Function for creating a new resume

// Validation schema for resume name validation using Zod
import { ResumeNameValidationSchema } from "@/lib/validations/resume";  // Zod validation schema for resume name

const AddResume = ({ userId }: { userId: string | undefined }) => {
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(ResumeNameValidationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof ResumeNameValidationSchema>
  ) => {
    if (userId === undefined) {
      return;
    }

    setIsLoading(true);

    const uuid = uuidv4();

    const result = await createResume({
      resumeId: uuid,
      userId: userId,
      title: values.name,
    });

    if (result.success) {
      form.reset();

      const resume = JSON.parse(result.data!);

      router.push(`/my-resume/${resume.resumeId}/edit`);
    } else {
      setIsLoading(false);

      toast({
        title: "Uh Oh! Something went wrong.",
        description: result?.error,
        variant: "destructive",
        className: "bg-white",
      });
    }
  };

  return (
    <div
    className="relative p-6 py-12 border border-[#007AFF] flex flex-col justify-center items-center bg-white text-[#007AFF] h-[180px] w-[160px] hover:shadow-lg hover:scale-90 transition-all duration-300 ease-in-out rounded-lg cursor-pointer shadow-lg"
    onMouseEnter={() => setShowOptions(true)}
    onMouseLeave={() => setShowOptions(false)}
  >
    {!showOptions ? (
      <div className="flex flex-col items-center gap-2 text-center font-semibold cursor-pointer">
      <FilePlus size={36} />
      <div className="flex flex-col items-center leading-tight">
        <p>Create Resume</p>
        <p className="text-sm font-normal text-gray-500">or</p>
        <p>Upload CV</p>
      </div>
    </div>
    ) : (
      <div className="flex flex-col items-center gap-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
        <Button
          onClick={() => setOpenDialog(true)}
          className="cursor-pointer w-[80%] bg-[#0053CC] text-white px-[16px] py-[10px] hover:bg-blue-900 transition-all rounded-md text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Create
        </Button>
  
        <Button
          variant="outline"
          className="cursor-pointer w-[80%] border-2 border-[#007AFF] text-[#007AFF] px-[16px] py-[10px] bg-white hover:bg-blue-50 transition-all rounded-md text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          Upload
        </Button>
  
        {/* Dialog for Create New Resume */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Resume</DialogTitle>
              <DialogDescription>
                Enter the title of your resume here. Click create when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="comment-form"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <p className="mt-2 mb-3 text-slate-700 font-semibold">
                          Resume Title:
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Example: Android Developer Resume"
                          className={`no-focus ${
                            form.formState.errors.name ? "error" : ""
                          }`}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div className="mt-10 flex justify-end gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDialog(false);
                      form.reset({ name: "" });
                    }}
                    className="btn-ghost"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isLoading || !form.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> &nbsp;
                        Creating
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    )}
  </div>
  
  );
};

export default AddResume;
